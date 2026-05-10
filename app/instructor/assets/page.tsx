import AssetUploadForm from "@/components/instructor/AssetUploadForm";
import { requireInstructorPage } from "@/lib/server/auth";
import { getInstructorWorkspaceData } from "@/lib/server/instructor-workspace";

function formatBytes(value: number | null) {
  if (!value) return "0 MB";
  const mb = value / (1024 * 1024);
  return `${Math.round(mb * 10) / 10} MB`;
}

export default async function InstructorAssetsPage() {
  const { supabase, user } = await requireInstructorPage({
    loginRedirect: "/login?redirect=/instructor/assets",
    fallbackRedirect: "/instructor",
  });
  const data = await getInstructorWorkspaceData(user.id, supabase);
  const uploadSubmissions = data.submissions
    .filter((submission) => submission.status === "published")
    .map((submission) => ({
      id: submission.id,
      slug: submission.slug,
      title: submission.title,
      modules: submission.payload.modules.map((module) => ({
        id: module.id,
        title: module.title,
        lessons: module.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
        })),
      })),
    }));

  return (
    <div className="min-h-[calc(100vh-4rem)] px-10 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-950">Media Uploads</h1>
        <p className="mt-2 text-slate-600">
          Video va resurslarni storage bucketga yuklash, analiz metadata va lesson mapping.
        </p>
      </div>

      <AssetUploadForm submissions={uploadSubmissions} />

      <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-7 py-5">
          <h2 className="text-xl font-black text-slate-950">Uploaded Assets</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {data.assets.length === 0 ? (
            <div className="px-7 py-12 text-center text-sm text-slate-500">
              Hali fayl yuklanmagan.
            </div>
          ) : (
            data.assets.map((asset) => (
              <article
                key={asset.id}
                className="grid gap-4 px-7 py-5 lg:grid-cols-[minmax(0,1.2fr)_1fr_auto]"
              >
                <div>
                  <p className="font-black text-slate-950">{asset.title}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {asset.course_id} {asset.lesson_id ? `| ${asset.lesson_id}` : ""}
                  </p>
                </div>
                <div className="text-sm text-slate-600">
                  <p>{asset.mime_type ?? asset.asset_type}</p>
                  <p className="mt-1">{formatBytes(asset.size_bytes)}</p>
                </div>
                <span className="h-fit rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase text-emerald-800">
                  {asset.status}
                </span>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
