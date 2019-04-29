resource "aws_cloudfront_distribution" "punkapi" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "Managed by Terraform"

  origin {
    origin_id   = "punkapi"
    domain_name = "api.punkapi.com"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_ssl_protocols   = ["TLSv1", "TLSv1.1", "TLSv1.2"]
      origin_protocol_policy = "https-only"
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "punkapi"

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 60
    default_ttl            = 60
  }

  aliases = [
    "beer.contentful.diogo.im",
  ]

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = "${data.aws_acm_certificate.main.arn}"
    minimum_protocol_version = "TLSv1"
    ssl_support_method = "sni-only"
  }
}
