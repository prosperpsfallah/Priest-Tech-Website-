const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


module.exports = async function handler(req, res) {

    if (req.method !== "POST") {

        return res.status(405).json({
            success: false,
            error: "Method not allowed. Use POST."
        });
    }


    try {

        const body = req.body || {};

        const message = body.message;


        if (
            !message ||
            typeof message !== "string"
        ) {

            return res.status(400).json({
                success: false,
                error: "Message is required."
            });
        }


        const cleanMessage =
            message.trim();


        if (!cleanMessage) {

            return res.status(400).json({
                success: false,
                error: "Message cannot be empty."
            });
        }


        if (cleanMessage.length > 4000) {

            return res.status(400).json({
                success: false,
                error: "Message is too long."
            });
        }


        if (!process.env.GROQ_API_KEY) {

            console.error(
                "GROQ_API_KEY is missing."
            );

            return res.status(500).json({
                success: false,
                error: "GROQ_API_KEY is not configured on the server."
            });
        }


        const completion =
            await groq.chat.completions.create({

                model: "llama-3.3-70b-versatile",

                messages: [

                    {
                        role: "system",

                        content:
                            "You are PRIEST AI, the official AI assistant of PRIEST TECH. Be helpful, professional, friendly and clear. You are knowledgeable about technology, programming, web development, system administration, networking, IT support, cybersecurity concepts and digital solutions. When answering technical questions, give practical explanations. Never claim to have performed an action you did not perform."
                    },

                    {
                        role: "user",
                        content: cleanMessage
                    }

                ],

                temperature: 0.7,

                max_tokens: 1000
            });


        const reply =
            completion &&
            completion.choices &&
            completion.choices[0] &&
            completion.choices[0].message &&
            completion.choices[0].message.content;


        if (!reply) {

            return res.status(500).json({
                success: false,
                error: "PRIEST AI returned an empty response."
            });
        }


        return res.status(200).json({
            success: true,
            reply: reply
        });


    } catch (error) {

        console.error(
            "PRIEST AI ERROR:",
            error
        );


        return res.status(500).json({
            success: false,
            error:
                error &&
                error.message
                    ? error.message
                    : "PRIEST AI service is temporarily unavailable."
        });
    }
};