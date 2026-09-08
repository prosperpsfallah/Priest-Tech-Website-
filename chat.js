// Only allow POST requests
if (req.method !== "POST") {
    return res.status(405).json({
        success: false,
        error: "Method not allowed. Use POST."
    });
}

// Check API key before creating the Groq client
if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY is missing from Vercel.");

    return res.status(500).json({
        success: false,
        error: "GROQ_API_KEY is not configured on the server."
    });
}

try {

    // Create Groq client
    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    // Get request body
    const body = req.body || {};
    const message = body.message;

    // Validate message
    if (!message || typeof message !== "string") {
        return res.status(400).json({
            success: false,
            error: "Message is required."
        });
    }

    const cleanMessage = message.trim();

    if (!cleanMessage) {
        return res.status(400).json({
            success: false,
            error: "Message cannot be empty."
        });
    }

    if (cleanMessage.length > 4000) {
        return res.status(400).json({
            success: false,
            error: "Message is too long. Please keep it under 4000 characters."
        });
    }

    // Send request to Groq
    const completion = await groq.chat.completions.create({

        model: "llama-3.3-70b-versatile",

        messages: [
            {
                role: "system",
                content:
                    "You are PRIEST AI, the official AI assistant of PRIEST TECH. " +
                    "Be helpful, professional, friendly and clear. " +
                    "You are knowledgeable about technology, programming, web development, " +
                    "system administration, networking, IT support, cybersecurity concepts " +
                    "and digital solutions. " +
                    "When answering technical questions, give practical explanations. " +
                    "Never claim to have performed an action you did not perform."
            },
            {
                role: "user",
                content: cleanMessage
            }
        ],

        temperature: 0.7,

        max_tokens: 1000
    });

    // Extract response
    const reply =
        completion?.choices?.[0]?.message?.content;

    if (!reply) {
        console.error(
            "Groq returned no message:",
            completion
        );

        return res.status(500).json({
            success: false,
            error: "PRIEST AI returned an empty response."
        });
    }

    // Send response back to website
    return res.status(200).json({
        success: true,
        reply: reply.trim()
    });

} catch (error) {

    console.error("PRIEST AI / GROQ ERROR:", error);

    // Groq/API errors
    const status =
        error?.status ||
        error?.statusCode ||
        500;

    let errorMessage =
        "PRIEST AI service is temporarily unavailable.";

    if (status === 401) {
        errorMessage =
            "PRIEST AI authentication failed. Please check the GROQ_API_KEY in Vercel.";
    }

    else if (status === 429) {
        errorMessage =
            "PRIEST AI is temporarily busy because the API rate limit was reached. Please try again shortly.";
    }

    else if (status === 400) {
        errorMessage =
            error?.message ||
            "PRIEST AI received an invalid request.";
    }

    else if (error?.message) {
        errorMessage = error.message;
    }

    return res.status(500).json({
        success: false,
        error: errorMessage
    });
}