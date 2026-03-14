import CallForm from "../components/CallForm";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-black">
          Bland AI Scheduler
        </h1>
        {/* This is the component we created in src/components/CallForm.tsx */}
        <CallForm />
      </div>
    </main>
  );
}
