// GroupCreatorPage.tsx
import GroupCreator from "./GroupCreator";

export default function GroupCreatorPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-gray-900 rounded-2xl shadow-xl p-8">
        <GroupCreator />
      </div>
    </div>
  );
}
