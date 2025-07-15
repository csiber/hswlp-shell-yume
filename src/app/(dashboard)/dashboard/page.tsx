import dynamic from "next/dynamic"

const UploadBox = dynamic(() => import("@/plugins/UploadBox/UploadBox"), {
  ssr: false,
})
const FeedGrid = dynamic(() => import("@/plugins/FeedGrid/FeedGrid"), {
  ssr: false,
})

export default function Page() {
  return (
    <div className="p-4 space-y-6">
      <UploadBox />
      <FeedGrid />
    </div>
  )
}
