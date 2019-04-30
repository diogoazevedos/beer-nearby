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

data "aws_region" "current" {
  # ...
}

data "aws_route53_zone" "domain" {
  name = "diogo.im"
}

data "aws_acm_certificate" "main" {
  domain = "contentful.diogo.im"
}

resource "aws_route53_record" "api" {
  name    = "api.contentful.diogo.im"
  type    = "CNAME"
  ttl     = 300
  zone_id = "${data.aws_route53_zone.domain.id}"

  records = [
    "${aws_cloudfront_distribution.api.domain_name}",
  ]
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
