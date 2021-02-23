import ec2 = require("@aws-cdk/aws-ec2");
import ecs = require("@aws-cdk/aws-ecs");
import * as cdk from "@aws-cdk/core";

export class EcsServiceWithLoggingStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "rajdasr-solarc-vpc", {
      cidr: "10.101.0.0/16",
    });

    /*    const capacityOptions = {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MEDIUM
      ),
      minCapacity: 2,
    };*/

    const cluster = new ecs.Cluster(this, "Ec2Cluster", {
      vpc,
      //capacity: capacityOptions,
    });

    cluster.addCapacity("DefaultAutoScalingGroup", {
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MEDIUM
      ),
    });

    // create a task definition with CloudWatch Logs
    // const logging = new ecs.AwsLogDriver({ streamPrefix: "myapp" })

    const appContainerfireLensDriverProps = {
      Name: "cloudwatch",
      region: "us-east-1",
      log_group_name: "plasmaglass",
      log_stream_name: "appstream",
      auto_create_group: "true",
    };

    const logging = new ecs.FireLensLogDriver({
      options: appContainerfireLensDriverProps,
    });

    const taskDef = new ecs.Ec2TaskDefinition(this, "MyTaskDefinition");
    taskDef.addContainer("AppContainer", {
      image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"),
      memoryLimitMiB: 512,
      logging,
    });

    const idsContainerFirelensDriverProps = {
      Name: "cloudwatch",
      region: "us-east-1",
      log_group_name: "falco",
      log_stream_name: "alerts",
      auto_create_group: "true",
    };

    const idsLogging = new ecs.FireLensLogDriver({
      options: idsContainerFirelensDriverProps,
    });

    const idsContainerDef: ecs.ContainerDefinition = taskDef.addContainer(
      "idsContainer",
      {
        image: ecs.ContainerImage.fromRegistry("falcosecurity/falco:0.17.1"),
        cpu: 10,
        memoryLimitMiB: 512,
        privileged: true,
        command: ["/usr/bin/falco", "-pc", "-o", "json_output=true"],
        logging: idsLogging,
      }
    );

    // Volumes - start
    taskDef.addVolume({
      name: "docker-socket",
      host: {
        sourcePath: "/var/run/docker.sock",
      },
    });

    taskDef.addVolume({
      name: "dev-fs",
      host: { sourcePath: "/dev" },
    });

    taskDef.addVolume({ name: "proc-fs", host: { sourcePath: "/proc" } });

    taskDef.addVolume({ name: "boot-fs", host: { sourcePath: "/boot" } });

    taskDef.addVolume({
      name: "lib-modules",
      host: { sourcePath: "/lib/modules" },
    });

    taskDef.addVolume({
      name: "usr-fs",
      host: { sourcePath: "/usr" },
    });

    // Volumes - end
    // Mount points - start
    const dockerSocket: ecs.MountPoint = {
      containerPath: "/host/var/run/docker.sock",
      sourceVolume: "docker-socket",
      readOnly: false,
    };

    const devFs: ecs.MountPoint = {
      containerPath: "/host/dev",
      sourceVolume: "dev-fs",
      readOnly: false,
    };

    const hostProc: ecs.MountPoint = {
      containerPath: "/host/proc",
      sourceVolume: "proc-fs",
      readOnly: true,
    };

    const hostBoot: ecs.MountPoint = {
      containerPath: "/host/boot",
      sourceVolume: "boot-fs",
      readOnly: true,
    };

    const hostLibMods: ecs.MountPoint = {
      containerPath: "/host/lib/modules",
      sourceVolume: "lib-modules",
      readOnly: true,
    };

    const hostUsr: ecs.MountPoint = {
      containerPath: "/host/usr",
      sourceVolume: "usr-fs",
      readOnly: true,
    };

    idsContainerDef.addMountPoints(
      dockerSocket,
      devFs,
      hostProc,
      hostBoot,
      hostLibMods,
      hostUsr
    );

    // Instantiate ECS Service with just cluster and image
    new ecs.Ec2Service(this, "Ec2Service", {
      cluster,
      taskDefinition: taskDef,
    });
  }
}
