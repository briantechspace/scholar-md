import fetch from "node-fetch";

const MPESA_CONSUMER_KEY = "SyKDM3mfjAVijZCp3olDeD6KP53SklOkbjnEfUiRPmEGQwvE";
const MPESA_CONSUMER_SECRET = "4uqwHRhpP49TAKNOFamjxdyu2hIgkYR355yjivY7czE4GyVEAYpWAbyDqcVtKvPJ";
const MPESA_SHORTCODE = "174379";
const MPESA_PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd";
const MPESA_CALLBACK = "https://scholar-md.onrender.com/api/mpesa/callback";

async function getToken() {
  const res = await fetch(
    "https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString("base64")
      }
    }
  );
  return (await res.json()).access_token;
}

export async function stkPush(phone, amount, ref) {
  const token = await getToken();
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0,14);
  const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString("base64");

  const res = await fetch(
    "https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: MPESA_CALLBACK,
        AccountReference: ref,
        TransactionDesc: "SCHOLAR MD Premium"
      })
    }
  );

  return res.json();
}
