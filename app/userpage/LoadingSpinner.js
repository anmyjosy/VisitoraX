export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-[#552483]"></div>
    </div>
  );
}