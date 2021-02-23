# ECS with Falco, logging using Firelens

ECSServiceWithLogginCfnWithUserDataFalcoInstall.json has the user data. In case you have cidr range conflicts etc.:

* Update the aws account id/region in bin/ecs_service_with_logging.ts
* Update the cidr in lib/ecs_service_with_logging-stack.ts
* `npm run build`
* `cdk synth` (to generate the Cfn template) and then update it to include *rpm --import https://falco.org/repo/falcosecurity-3672BA8F.asc\ncurl -s -o /etc/yum.repos.d/falcosecurity.repo https://falco.org/repo/falcosecurity-rpm.repo\nyum -y install kernel-devel-$(uname -r)\nyum -y install falco\n*
* Alternatively, * `cdk bootstrap` (optional in case already run on the account) and deploy using `cdk deploy --require-approval=never` and then grab the Cfn template from there and update it.


The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
