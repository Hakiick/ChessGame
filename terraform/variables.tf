variable "env" {
  description = "Deployment environment (dev, staging, prod)"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.env)
    error_message = "env must be one of: dev, staging, prod."
  }
}

variable "location" {
  description = "Azure region where resources will be deployed"
  type        = string
  default     = "swedencentral"

  validation {
    condition     = contains(["uksouth", "swedencentral", "polandcentral", "switzerlandnorth", "germanywestcentral"], var.location)
    error_message = "Location must be one of the allowed regions: uksouth, swedencentral, polandcentral, switzerlandnorth, germanywestcentral."
  }
}

variable "project_name" {
  description = "Project name used in resource naming (lowercase letters and hyphens only)"
  type        = string
  default     = "chessgame"
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]*[a-z0-9]$", var.project_name))
    error_message = "project_name must start with a lowercase letter, end with a letter or digit, and contain only lowercase letters, digits, and hyphens."
  }
}

variable "sku_name" {
  description = "App Service Plan SKU (F1=free, B1=basic, B2/B3=standard, S1/S2/S3=premium)"
  type        = string
  default     = "B1"
  validation {
    condition     = contains(["F1", "B1", "B2", "B3", "S1", "S2", "S3"], var.sku_name)
    error_message = "sku_name must be one of: F1, B1, B2, B3, S1, S2, S3."
  }
}

variable "subscription_id" {
  description = "Azure subscription ID (UUID format). Run: az account show --query id -o tsv"
  type        = string
  validation {
    condition     = can(regex("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", var.subscription_id))
    error_message = "subscription_id must be a valid UUID (e.g. xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)."
  }
}

variable "node_version" {
  description = "Node.js LTS version for the App Service runtime"
  type        = string
  default     = "20-lts"
  validation {
    condition     = contains(["18-lts", "20-lts", "22-lts"], var.node_version)
    error_message = "node_version must be one of: 18-lts, 20-lts, 22-lts."
  }
}
