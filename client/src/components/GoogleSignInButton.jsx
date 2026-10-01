import { GoogleLogin } from "@react-oauth/google";

export default function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
}) {
  return (
    <div
      className={`w-full flex justify-center ${
        disabled ? "pointer-events-none opacity-50" : ""
      }`}
    >
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          if (credentialResponse?.credential) {
            onSuccess(credentialResponse.credential);
          } else {
            onError?.();
          }
        }}
        onError={() => {
          onError?.();
        }}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="100%"
      />
    </div>
  );
}