// Ide kerülhetne a Google SSO logika, jelenleg le van tiltva
export const onRequestGet = async () => {
  return new Response("Google SSO disabled", { status: 404 });
};

