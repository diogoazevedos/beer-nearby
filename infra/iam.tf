data "aws_iam_policy_document" "lambda" {
  statement {
    actions = [
      "sts:AssumeRole",
    ]

    principals {
      type = "Service"

      identifiers = [
        "lambda.amazonaws.com",
      ]
    }
  }
}

resource "aws_iam_role" "check_in" {
  name               = "${local.check_in}"
  assume_role_policy = "${data.aws_iam_policy_document.lambda.json}"
}

data "aws_iam_policy_document" "check_in_policy" {
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      "${aws_cloudwatch_log_group.check_in.arn}",
    ]
  }

  statement {
    actions = [
      "es:ESHttpPost",
    ]

    resources = [
      "${aws_elasticsearch_domain.elasticsearch.arn}/*",
    ]
  }
}

resource "aws_iam_role_policy" "check_in" {
  role   = "${aws_iam_role.check_in.name}"
  policy = "${data.aws_iam_policy_document.check_in_policy.json}"
}

resource "aws_iam_role" "look_nearby" {
  name               = "${local.look_nearby}"
  assume_role_policy = "${data.aws_iam_policy_document.lambda.json}"
}

data "aws_iam_policy_document" "look_nearby_policy" {
  statement {
    actions = [
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]

    resources = [
      "${aws_cloudwatch_log_group.look_nearby.arn}",
    ]
  }

  statement {
    actions = [
      "es:ESHttpGet",
    ]

    resources = [
      "${aws_elasticsearch_domain.elasticsearch.arn}/*",
    ]
  }
}

resource "aws_iam_role_policy" "look_nearby" {
  role   = "${aws_iam_role.look_nearby.name}"
  policy = "${data.aws_iam_policy_document.look_nearby_policy.json}"
}
