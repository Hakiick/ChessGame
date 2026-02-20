locals {
  resource_prefix = "${var.project_name}-${var.env}"
  tags = {
    project     = var.project_name
    environment = var.env
    managed_by  = "terraform"
  }
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "rg-${local.resource_prefix}"
  location = var.location
  tags     = local.tags
}

# App Service Plan (Linux, B1)
resource "azurerm_service_plan" "main" {
  name                = "asp-${local.resource_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.sku_name
  tags                = local.tags
}

# App Service (Node.js 20 LTS)
resource "azurerm_linux_web_app" "chessgame" {
  name                = "app-${local.resource_prefix}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id
  https_only          = true

  site_config {
    always_on                         = var.sku_name != "F1"
    http2_enabled                     = true
    minimum_tls_version               = "1.2"
    ftps_state                        = "Disabled"
    health_check_path                 = "/"
    health_check_eviction_time_in_min = 10

    application_stack {
      node_version = var.node_version
    }
  }

  app_settings = {
    WEBSITES_ENABLE_APP_SERVICE_STORAGE = "false"
    NODE_ENV                            = "production"
    PORT                                = "3000"
    NEXT_TELEMETRY_DISABLED             = "1"
    SCM_DO_BUILD_DURING_DEPLOYMENT      = "true"
  }

  tags = local.tags
}
