resource "aws_cloudwatch_log_group" "check_in" {
  name              = "/aws/lambda/${local.check_in}"
  retention_in_days = 7
}

data "archive_file" "check_in" {
  type        = "zip"
  output_path = "checkIn.zip"

  source {
    content  = "${file("dist/checkIn.js")}"
    filename = "index.js"
  }
}

resource "aws_lambda_function" "check_in" {
  function_name    = "${local.check_in}"
  filename         = "${data.archive_file.check_in.output_path}"
  runtime          = "nodejs8.10"
  handler          = "index.handler"
  role             = "${aws_iam_role.check_in.arn}"
  source_code_hash = "${data.archive_file.check_in.output_base64sha256}"

  environment {
    variables {
      ELASTICSEARCH_HOST = "${aws_elasticsearch_domain.elasticsearch.endpoint}"
    }
  }
}

resource "aws_lambda_permission" "check_in" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.check_in.function_name}"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_stage.stage.execution_arn}/*/*"
}

resource "aws_cloudwatch_log_group" "look_nearby" {
  name              = "/aws/lambda/${local.look_nearby}"
  retention_in_days = 7
}

data "archive_file" "look_nearby" {
  type        = "zip"
  output_path = "lookNearby.zip"

  source {
    content  = "${file("dist/lookNearby.js")}"
    filename = "index.js"
  }
}

resource "aws_lambda_function" "look_nearby" {
  function_name    = "${local.look_nearby}"
  filename         = "${data.archive_file.look_nearby.output_path}"
  runtime          = "nodejs8.10"
  handler          = "index.handler"
  role             = "${aws_iam_role.look_nearby.arn}"
  source_code_hash = "${data.archive_file.look_nearby.output_base64sha256}"

  environment {
    variables {
      ELASTICSEARCH_HOST = "${aws_elasticsearch_domain.elasticsearch.endpoint}"
    }
  }
}

resource "aws_lambda_permission" "look_nearby" {
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.look_nearby.function_name}"
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_stage.stage.execution_arn}/*/*"
}
