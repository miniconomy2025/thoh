variable "budget_emails" {
  description = "List of email addresses to receive budget alerts"
  type        = list(string)
} 

# use environment variables for security
variable "db_username" {
  type      = string
  sensitive = true
}

variable "db_password" {
  type      = string
  sensitive = true
}