import { useState } from "react";
import { useLocation, useNavigate, useParams, Navigate } from "react-router-dom";
import RegistrationStepper from "../../components/registration/RegistrationStepper";
import { mockEventDetail, ticketCategories, registerAttendee } from "../../lib/registrationMockData";

const steps = ["Personal Details", "Payment", "Confirmation"];
const paymentMethods = ["UPI", "Credit / Debit Card", "Net Banking"];

interface LocationState {
  fullName: string;
  email: string;
  phone: string;
  college: string;
  categoryId: string;
}

type PaymentStage = "form" | "processing" | "success" | "failed";

export default function AttendeePayment() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [method, setMethod] = useState(paymentMethods[0]);
  const [upiId, setUpiId] = useState("");
  const [stage, setStage] = useState<PaymentStage>("form");
  const [transactionId, setTransactionId] = useState("");

  if (!state || !eventId) return <Navigate to={`/events/${eventId ?? ""}`} replace />;

  const category = ticketCategories.find((c) => c.id === state.categoryId);
  if (!category) return <Navigate to={`/events/${eventId}`} replace />;

  function handlePay() {
    setStage("processing");
    setTimeout(() => {
      // Mock outcome — real integration replaces this with an actual
      // payment gateway callback.
      const succeeded = true;
      if (succeeded) {
        registerAttendee(eventId!, category!);
        setTransactionId(`TXN-${Date.now().toString().slice(-9)}`);
        setStage("success");
        setTimeout(() => {
          navigate(`/events/${eventId}/registration-success`);
        }, 1200);
      } else {
        setStage("failed");
      }
    }, 1500);
  }

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <RegistrationStepper steps={steps} currentStep={2} />

      <h1 className="mt-8 text-xl font-bold text-[#1E293B]">Complete your registration</h1>

      <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="text-sm text-[#64748B]">{mockEventDetail.name}</div>
        <div className="text-sm text-[#64748B]">{category.name} Ticket</div>
        <div className="mt-2 text-2xl font-bold text-[#1E293B]">&#8377;{category.price}</div>
      </div>

      {stage === "form" && (
        <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#1E293B]">Payment Method</h2>
          <div className="mt-3 flex flex-col gap-2">
            {paymentMethods.map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm ${
                  method === option ? "border-[#2563EB] bg-[#EFF6FF]" : "border-[#E2E8F0]"
                }`}
              >
                <input
                  type="radio"
                  name="method"
                  checked={method === option}
                  onChange={() => setMethod(option)}
                  className="h-4 w-4 text-[#2563EB]"
                />
                {option}
              </label>
            ))}
          </div>

          {method === "UPI" && (
            <div className="mt-3">
              <label className="text-sm font-medium text-[#1E293B]">UPI ID</label>
              <input
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi"
                className="mt-1.5 w-full rounded-lg border border-[#E2E8F0] px-3.5 py-2.5 text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handlePay}
            className="mt-5 w-full rounded-lg bg-[#2563EB] py-3 text-sm font-medium text-white hover:bg-[#1D4ED8]"
          >
            Pay &#8377;{category.price}
          </button>
        </div>
      )}

      {stage === "processing" && (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-[#E2E8F0] bg-white p-8 text-center shadow-sm">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#E2E8F0] border-t-[#2563EB]" />
          <p className="text-sm text-[#64748B]">Processing Payment...</p>
        </div>
      )}

      {stage === "success" && (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] p-8 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-[#16A34A]">
            &#10003;
          </div>
          <h2 className="text-lg font-bold text-[#1E293B]">Payment Successful</h2>
          <p className="text-sm text-[#64748B]">&#8377;{category.price} Paid</p>
          <p className="text-xs text-[#94A3B8]">Transaction ID: {transactionId}</p>
        </div>
      )}

      {stage === "failed" && (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-8 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-[#DC2626]">
            &#10007;
          </div>
          <h2 className="text-lg font-bold text-[#1E293B]">Payment Failed</h2>
          <p className="text-sm text-[#64748B]">
            We couldn&apos;t complete your payment. Your registration has not been confirmed.
          </p>
          <div className="mt-3 flex w-full gap-2">
            <button
              type="button"
              onClick={() => setStage("form")}
              className="flex-1 rounded-lg border border-[#E2E8F0] bg-white py-2.5 text-sm font-medium text-[#1E293B] hover:bg-[#F8FAFC]"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => setStage("form")}
              className="flex-1 rounded-lg bg-[#2563EB] py-2.5 text-sm font-medium text-white hover:bg-[#1D4ED8]"
            >
              Change Payment Method
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
