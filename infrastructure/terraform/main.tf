# FitnessApp Infrastructure as Code
# Complete environment recreation with autoscaling and monitoring

terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 4.0"
    }
  }
  
  backend "gcs" {
    bucket = "fitness-app-terraform-state"
    prefix = "terraform/state"
  }
}

# ============================================================================
# VARIABLES
# ============================================================================

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "fitness-app-bupe-staging"
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment (staging/production)"
  type        = string
  default     = "staging"
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "fitness-app"
}

# ============================================================================
# PROVIDERS
# ============================================================================

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

# ============================================================================
# DATA SOURCES
# ============================================================================

data "google_project" "project" {
  project_id = var.project_id
}

# ============================================================================
# FIREBASE PROJECT CONFIGURATION
# ============================================================================

resource "google_firebase_project" "default" {
  provider = google-beta
  project  = var.project_id
}

resource "google_firebase_web_app" "default" {
  provider     = google-beta
  project      = var.project_id
  display_name = "${var.app_name}-${var.environment}"
  
  depends_on = [google_firebase_project.default]
}

resource "google_firebase_hosting_site" "default" {
  provider = google-beta
  project  = var.project_id
  site_id  = "${var.app_name}-${var.environment}"
  
  depends_on = [google_firebase_project.default]
}

# ============================================================================
# FIRESTORE DATABASE
# ============================================================================

resource "google_firestore_database" "default" {
  provider                    = google-beta
  project                     = var.project_id
  name                       = "(default)"
  location_id                = var.region
  type                       = "FIRESTORE_NATIVE"
  concurrency_mode           = "OPTIMISTIC"
  app_engine_integration_mode = "DISABLED"
  
  depends_on = [google_firebase_project.default]
}

# ============================================================================
# CLOUD FUNCTIONS
# ============================================================================

resource "google_cloudfunctions2_function" "api_functions" {
  for_each = toset([
    "user-management",
    "workout-plans",
    "progress-tracking",
    "notifications"
  ])
  
  name     = "${var.app_name}-${each.key}-${var.environment}"
  location = var.region
  project  = var.project_id
  
  build_config {
    runtime     = "nodejs18"
    entry_point = "main"
    source {
      storage_source {
        bucket = google_storage_bucket.functions_source.name
        object = google_storage_bucket_object.function_source[each.key].name
      }
    }
  }
  
  service_config {
    max_instance_count    = var.environment == "production" ? 100 : 10
    min_instance_count    = var.environment == "production" ? 1 : 0
    available_memory      = "256M"
    timeout_seconds       = 60
    max_instance_request_concurrency = 80
    
    environment_variables = {
      NODE_ENV    = var.environment
      PROJECT_ID  = var.project_id
      REGION      = var.region
    }
    
    secret_environment_variables {
      key        = "DATABASE_URL"
      project_id = var.project_id
      secret_id  = google_secret_manager_secret.database_url.secret_id
      version    = "latest"
    }
  }
  
  depends_on = [
    google_project_service.cloudfunctions,
    google_project_service.cloudbuild
  ]
}

# ============================================================================
# CLOUD STORAGE
# ============================================================================

resource "google_storage_bucket" "functions_source" {
  name     = "${var.project_id}-functions-source"
  location = var.region
  
  uniform_bucket_level_access = true
  
  versioning {
    enabled = true
  }
  
  lifecycle_rule {
    condition {
      age = 30
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_storage_bucket" "user_uploads" {
  name     = "${var.project_id}-user-uploads"
  location = var.region
  
  uniform_bucket_level_access = true
  
  cors {
    origin          = ["https://${var.app_name}-${var.environment}.web.app"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
  
  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
}

resource "google_storage_bucket_object" "function_source" {
  for_each = toset([
    "user-management",
    "workout-plans", 
    "progress-tracking",
    "notifications"
  ])
  
  name   = "functions/${each.key}.zip"
  bucket = google_storage_bucket.functions_source.name
  source = "../functions/dist/${each.key}.zip"
}

# ============================================================================
# SECRET MANAGER
# ============================================================================

resource "google_secret_manager_secret" "database_url" {
  secret_id = "database-url"
  project   = var.project_id
  
  replication {
    automatic = true
  }
}

resource "google_secret_manager_secret" "api_keys" {
  secret_id = "api-keys"
  project   = var.project_id
  
  replication {
    automatic = true
  }
}

# ============================================================================
# CLOUD MONITORING
# ============================================================================

resource "google_monitoring_alert_policy" "high_error_rate" {
  display_name = "High Error Rate - ${var.environment}"
  project      = var.project_id
  
  conditions {
    display_name = "Error rate > 5%"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_function\" AND resource.labels.function_name=~\"${var.app_name}-.*-${var.environment}\""
      duration        = "300s"
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 0.05
      
      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
        cross_series_reducer = "REDUCE_MEAN"
        group_by_fields = ["resource.labels.function_name"]
      }
    }
  }
  
  notification_channels = [
    google_monitoring_notification_channel.slack.name,
    google_monitoring_notification_channel.email.name
  ]
  
  alert_strategy {
    auto_close = "1800s"
  }
}

resource "google_monitoring_alert_policy" "high_latency" {
  display_name = "High Latency - ${var.environment}"
  project      = var.project_id
  
  conditions {
    display_name = "95th percentile latency > 2s"
    
    condition_threshold {
      filter          = "resource.type=\"cloud_function\""
      duration        = "300s"
      comparison      = "COMPARISON_GREATER_THAN"
      threshold_value = 2000
      
      aggregations {
        alignment_period     = "60s"
        per_series_aligner   = "ALIGN_DELTA"
        cross_series_reducer = "REDUCE_PERCENTILE_95"
      }
    }
  }
  
  notification_channels = [google_monitoring_notification_channel.slack.name]
}

resource "google_monitoring_notification_channel" "slack" {
  display_name = "Slack Notifications"
  type         = "slack"
  project      = var.project_id
  
  labels = {
    channel_name = "#alerts"
    url          = var.slack_webhook_url
  }
}

resource "google_monitoring_notification_channel" "email" {
  display_name = "Email Notifications"
  type         = "email"
  project      = var.project_id
  
  labels = {
    email_address = "alerts@fitnessapp.com"
  }
}

# ============================================================================
# CLOUD SCHEDULER (for maintenance tasks)
# ============================================================================

resource "google_cloud_scheduler_job" "cleanup_old_data" {
  name     = "cleanup-old-data-${var.environment}"
  project  = var.project_id
  region   = var.region
  schedule = "0 2 * * *" # Daily at 2 AM
  
  http_target {
    http_method = "POST"
    uri         = "https://${var.region}-${var.project_id}.cloudfunctions.net/cleanup-old-data"
    
    headers = {
      "Content-Type" = "application/json"
    }
    
    body = base64encode(jsonencode({
      environment = var.environment
      retention_days = var.environment == "production" ? 365 : 90
    }))
  }
}

resource "google_cloud_scheduler_job" "generate_reports" {
  name     = "generate-reports-${var.environment}"
  project  = var.project_id
  region   = var.region
  schedule = "0 6 * * 1" # Weekly on Monday at 6 AM
  
  http_target {
    http_method = "POST"
    uri         = "https://${var.region}-${var.project_id}.cloudfunctions.net/generate-reports"
    
    headers = {
      "Content-Type" = "application/json"
    }
    
    body = base64encode(jsonencode({
      environment = var.environment
      report_type = "weekly"
    }))
  }
}

# ============================================================================
# REQUIRED APIS
# ============================================================================

resource "google_project_service" "required_apis" {
  for_each = toset([
    "firebase.googleapis.com",
    "firestore.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudscheduler.googleapis.com",
    "monitoring.googleapis.com",
    "secretmanager.googleapis.com",
    "storage.googleapis.com"
  ])
  
  project = var.project_id
  service = each.key
  
  disable_on_destroy = false
}

# ============================================================================
# OUTPUTS
# ============================================================================

output "firebase_config" {
  description = "Firebase configuration for the web app"
  value = {
    apiKey    = google_firebase_web_app.default.api_key
    authDomain = "${var.project_id}.firebaseapp.com"
    projectId = var.project_id
    storageBucket = "${var.project_id}.appspot.com"
    messagingSenderId = data.google_project.project.number
    appId = google_firebase_web_app.default.app_id
  }
  sensitive = true
}

output "hosting_url" {
  description = "Firebase Hosting URL"
  value       = "https://${google_firebase_hosting_site.default.site_id}.web.app"
}

output "function_urls" {
  description = "Cloud Function URLs"
  value = {
    for k, v in google_cloudfunctions2_function.api_functions : k => v.service_config[0].uri
  }
}
