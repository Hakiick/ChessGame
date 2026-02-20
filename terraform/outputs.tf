output "app_url" {
  description = "Public URL of the ChessGame App Service (HTTPS)"
  value       = "https://${azurerm_linux_web_app.chessgame.default_hostname}"
}

output "app_service_name" {
  description = "App Service resource name"
  value       = azurerm_linux_web_app.chessgame.name
}

output "resource_group_name" {
  description = "Resource Group name"
  value       = azurerm_resource_group.main.name
}

output "service_plan_name" {
  description = "App Service Plan name"
  value       = azurerm_service_plan.main.name
}
