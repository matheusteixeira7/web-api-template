export interface OAuthGoogleRequestDto {
  code: string;
}

export interface OAuthGoogleResponseDto {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}
