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

resource "aws_route53_record" "kibana" {
  name    = "kibana.contentful.diogo.im"
  type    = "CNAME"
  ttl     = 300
  zone_id = "${data.aws_route53_zone.domain.id}"

  records = [
    "${aws_elasticsearch_domain.elasticsearch.kibana_endpoint}",
  ]
}

resource "aws_route53_record" "elasticsearch" {
  name    = "elasticsearch.contentful.diogo.im"
  type    = "CNAME"
  ttl     = 300
  zone_id = "${data.aws_route53_zone.domain.id}"

  records = [
    "${aws_elasticsearch_domain.elasticsearch.endpoint}",
  ]
}

locals {
  check_in    = "beer-nearby-check-in"
  look_nearby = "beer-nearby-look-nearby"
}
