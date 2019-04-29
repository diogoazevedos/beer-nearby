resource "aws_elasticsearch_domain" "elasticsearch" {
  domain_name           = "beer-nearby"
  elasticsearch_version = "6.5"

  cluster_config {
    instance_type  = "t2.small.elasticsearch"
    instance_count = 1
  }

  ebs_options {
    volume_type = "gp2"
    volume_size = 10
    ebs_enabled = true
  }
}

data "aws_iam_policy_document" "elasticsearch" {
  statement {
    actions = [
      "es:*",
    ]

    resources = [
      "${aws_elasticsearch_domain.elasticsearch.arn}/*",
    ]

    condition {
      test     = "IpAddress"
      variable = "aws:SourceIp"

      values = [
        "177.38.112.200/32",
      ]
    }
  }
}

resource "aws_elasticsearch_domain_policy" "elasticsearch" {
  domain_name     = "${aws_elasticsearch_domain.elasticsearch.domain_name}"
  access_policies = "${data.aws_iam_policy_document.elasticsearch.json}"
}
