import {
  BedrockRuntimeClient,
  type BedrockRuntimeClientConfig,
} from "@aws-sdk/client-bedrock-runtime";

const config: BedrockRuntimeClientConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
};

const createBedrockClient = () => {
  return new BedrockRuntimeClient(config);
};

const globalForBedrockClient = globalThis as unknown as {
  bedrockClient: ReturnType<typeof createBedrockClient> | undefined;
};

export const bedrock = () => {
  return globalForBedrockClient.bedrockClient ?? createBedrockClient();
};

if (process.env.NODE_ENV !== "production")
  globalForBedrockClient.bedrockClient = bedrock();
