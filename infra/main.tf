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

data "aws_route53_zone" "domain" {
  name = "diogo.im"
}

data "aws_acm_certificate" "main" {
  domain = "contentful.diogo.im"
}

resource "aws_route53_record" "api" {
  name    = "${aws_api_gateway_domain_name.api.domain_name}"
  type    = "CNAME"
  zone_id = "${data.aws_route53_zone.domain.id}"

  alias {
    evaluate_target_health = true
    name                   = "${aws_api_gateway_domain_name.api.cloudfront_domain_name}"
    zone_id                = "${aws_api_gateway_domain_name.api.cloudfront_zone_id}"
  }
}

resource "aws_route53_record" "beer" {
  name    = "beer.contentful.diogo.im"
  type    = "CNAME"
  zone_id = "${data.aws_route53_zone.domain.id}"

  alias {
    evaluate_target_health = true
    name                   = "${aws_cloudfront_distribution.punkapi.domain_name}"
    zone_id                = "${aws_cloudfront_distribution.punkapi.hosted_zone_id}"
  }
}

locals {
  check_in    = "beer-nearby-check-in"
  look_nearby = "beer-nearby-look-nearby"
}

output "api_endpoint" {
  value = "${aws_api_gateway_stage.stage.invoke_url}"
}

output "kibana_endpoint" {
  value = "${aws_elasticsearch_domain.elasticsearch.kibana_endpoint}"
}

output "elasticsearch_endpoint" {
  value = "${aws_elasticsearch_domain.elasticsearch.endpoint}"
}
