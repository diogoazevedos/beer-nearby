resource "aws_api_gateway_rest_api" "api" {
  name = "beer-nearby"

  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

resource "aws_api_gateway_resource" "check_in" {
  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
  parent_id   = "${aws_api_gateway_rest_api.api.root_resource_id}"
  path_part   = "check_in"
}

resource "aws_api_gateway_method" "check_in" {
  rest_api_id   = "${aws_api_gateway_rest_api.api.id}"
  resource_id   = "${aws_api_gateway_resource.check_in.id}"
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "check_in" {
  rest_api_id             = "${aws_api_gateway_rest_api.api.id}"
  resource_id             = "${aws_api_gateway_method.check_in.resource_id}"
  http_method             = "${aws_api_gateway_method.check_in.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.check_in.invoke_arn}"
}

resource "aws_api_gateway_resource" "look_nearby" {
  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
  parent_id   = "${aws_api_gateway_rest_api.api.root_resource_id}"
  path_part   = "look_nearby"
}

resource "aws_api_gateway_method" "look_nearby" {
  rest_api_id   = "${aws_api_gateway_rest_api.api.id}"
  resource_id   = "${aws_api_gateway_resource.look_nearby.id}"
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "look_nearby" {
  rest_api_id             = "${aws_api_gateway_rest_api.api.id}"
  resource_id             = "${aws_api_gateway_method.look_nearby.resource_id}"
  http_method             = "${aws_api_gateway_method.look_nearby.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "${aws_lambda_function.look_nearby.invoke_arn}"
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id       = "${aws_api_gateway_rest_api.api.id}"
  stage_description = "Workaround ${md5(file("${path.module}/api.tf"))}"

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    "aws_api_gateway_integration.check_in",
    "aws_api_gateway_integration.look_nearby",
  ]
}

resource "aws_api_gateway_stage" "stage" {
  stage_name    = "live"
  rest_api_id   = "${aws_api_gateway_rest_api.api.id}"
  deployment_id = "${aws_api_gateway_deployment.deployment.id}"
}

resource "aws_api_gateway_usage_plan" "usage_plan" {
  name = "contenful"

  api_stages {
    api_id = "${aws_api_gateway_rest_api.api.id}"
    stage  = "${aws_api_gateway_stage.stage.stage_name}"
  }

  throttle_settings {
    burst_limit = 10
    rate_limit  = 20
  }
}

resource "aws_api_gateway_method_settings" "settings" {
  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
  stage_name  = "${aws_api_gateway_stage.stage.stage_name}"
  method_path = "*/*"

  settings {
    logging_level = "OFF"
  }
}
