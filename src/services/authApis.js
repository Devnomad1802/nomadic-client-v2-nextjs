import { api } from "../utils";

// Define a service using a base URL and expected endpoints
const authApis = api.injectEndpoints({
  overrideExisting: false,
  endpoints: (builder) => ({
    registerUser: builder.mutation({
      query: ({ name, email, phone, password }) => ({
        url: "/auth/register",
        method: "POST",
        body: { name, email, phone, password, role: "user" },
      }),
    }),

    editUser: builder.mutation({
      query: ({ name, email, phone, password }) => ({
        url: "/auth/editUser",
        method: "POST",
        body: { name, email, phone, password, role: "user" },
      }),
    }),

    // Profile edit with optional avatar upload — sends multipart FormData
    // (userId + name/email/phone/gender + profileImage file). Backend
    // /auth/editUser reads req.body.userId and req.uploadedFiles.profileImage.
    editUserProfile: builder.mutation({
      query: (formData) => ({
        url: "/auth/editUser",
        method: "POST",
        body: formData,
      }),
    }),

    sendSmsCode: builder.mutation({
      query: ({ number }) => ({
        url: "/auth/sendSmsCode",
        method: "POST",
        body: { number },
      }),
    }),
    verifySmsCode: builder.mutation({
      query: ({ phone, result }) => ({
        url: "/auth/verifySmsCode",
        method: "POST",
        body: { code: result, phone },
      }),
    }),

    loginUser: builder.mutation({
      query: ({ email, password }) => ({
        url: "/auth/login",
        method: "POST",
        body: { email, password },
      }),
    }),
    phoneLogin: builder.mutation({
      query: ({ phone }) => ({
        url: "/auth/phone-login",
        method: "POST",
        body: { phone },
      }),
    }),

    getUser: builder.query({
      query: () => ({
        url: "/auth/user",
        method: "GET",
      }),
    }),
    sendMailConfirmation: builder.mutation({
      query: () => ({
        url: "/auth/sendMail",
        method: "POST",
        body: {},
      }),
    }),
    resetPass: builder.mutation({
      query: (email) => ({
        url: `/auth/forgotPassword/${email}`,
        method: "GET",
      }),
    }),
    changePass: builder.mutation({
      query: ({ token, password }) => ({
        url: "/auth/changepassword",
        method: "POST",
        body: { token, password },
      }),
    }),

    sendEmailOtp: builder.mutation({
      query: ({ email }) => ({
        url: "/auth/send-email-otp",
        method: "POST",
        body: { email },
      }),
    }),
    verifyEmailOtp: builder.mutation({
      query: ({ email, otp }) => ({
        url: "/auth/verify-email-otp",
        method: "POST",
        body: { email, otp },
      }),
    }),
  }),
});

export const {
  useRegisterUserMutation,
  useResetPassMutation,
  useLoginUserMutation,
  useSendMailConfirmationMutation,
  useVerifySmsCodeMutation,
  useGetUserQuery,
  usePrefetch,
  useChangePassMutation,
  useSendSmsCodeMutation,
  usePhoneLoginMutation,
  useEditUserMutation,
  useEditUserProfileMutation,
  useSendEmailOtpMutation,
  useVerifyEmailOtpMutation,
} = authApis;
