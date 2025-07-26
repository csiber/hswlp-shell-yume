// Google SSO logic could go here, currently disabled
export const onRequestGet = async () => {
  return new Response("Google SSO disabled", { status: 404 });
};

