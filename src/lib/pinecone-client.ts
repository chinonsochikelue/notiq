import { Pinecone } from "@pinecone-database/pinecone";

// Singleton instance
let pinecone: Pinecone | null = null;

export const getPineconeClient = async () => {
    if (pinecone) {
        return pinecone;
    }

    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
        console.warn("PINECONE_API_KEY is not set. Vector features will be disabled.");
        return null;
    }

    pinecone = new Pinecone({
        apiKey: apiKey,
    });

    return pinecone;
};

export const ensureIndexRef = async (indexName: string = "notiq-index") => {
    const client = await getPineconeClient();
    if (!client) return null;

    try {
        const existingIndexes = await client.listIndexes();
        // Check if index exists by name, handling different response structures
        const indexExists = existingIndexes?.indexes?.some(i => i.name === indexName);

        if (!indexExists) {
            console.log(`Index ${indexName} not found. Attempting creation...`);
            // Warning: Creating an index might take time and might fail on free tier if quota exceeded.
            try {
                await client.createIndex({
                    name: indexName,
                    dimension: 1536, // OpenAI default, adjust if using Google/Groq embeddings
                    metric: "cosine",
                    spec: {
                        serverless: {
                            cloud: "aws",
                            region: "us-east-1",
                        },
                    },
                });
                console.log(`Index ${indexName} created successfully.`);
                // Wait a bit for initialization?
            } catch (createError) {
                console.error("Failed to create Pinecone index (likely permissions or quota):", createError);
                return null;
            }
        }

        return client.index(indexName);
    } catch (error) {
        console.error("Error accessing Pinecone:", error);
        return null;
    }
};
