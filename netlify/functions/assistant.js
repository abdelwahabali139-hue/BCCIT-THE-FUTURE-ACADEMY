
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "OPENAI_API_KEY is not configured"
        })
      };
    }

    const body = JSON.parse(event.body || "{}");
    const question = body.message || body.question || "";

    if (!question.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Please enter a question" })
      };
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          instructions:
            "أنت المستشار التعليمي الذكي لأكاديمية BCCIT THE FUTURE ACADEMY. تحدث باللغة العربية بأسلوب ودود واحترافي ومشجع. ساعد الزائر على فهم الدورات التدريبية واختيار ما يناسب أهدافه. لا تخترع أسعارًا أو مواعيد أو شهادات غير مذكورة في بيانات الأكاديمية. إذا لم تتوفر معلومة، اطلب من الزائر التواصل مع الأكاديمية.",
          input: question
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.error?.message || "AI service request failed"
        })
      };
    }

    const answer =
      data.output_text ||
      "عذرًا، لم أتمكن من إعداد إجابة الآن. حاول مرة أخرى.";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({ answer })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "حدث خطأ أثناء الاتصال بالمستشار الذكي."
      })
    };
  }
};
