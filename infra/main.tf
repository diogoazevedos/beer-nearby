terraform {
  backend "s3" {
    key    = "beer-nearby/terraform.tfstate"
    bucket = "sparkbox"
    region = "us-east-1"
  }
}

provider "aws" {
  region  = "us-east-1"
  version = "~> 2.8"
}

provider "archive" {
  version = "~> 1.2"
}

locals {
  check_in    = "beer-nearby-check-in"
  look_nearby = "beer-nearby-look-nearby"
}

output "kibana_endpoint" {
  value = "${aws_elasticsearch_domain.elasticsearch.kibana_endpoint}"
}

output "elasticsearch_endpoint" {
  value = "${aws_elasticsearch_domain.elasticsearch.endpoint}"
}
