"use client"

export default function RightSidebar() {
  return (
    <aside className="hidden w-[280px] px-4 py-6 lg:block">
      <div className="rounded-xl bg-white p-4 shadow dark:bg-gray-800">
        <h3 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-100">
          Sponsored
        </h3>
        <div className="overflow-hidden rounded-md">
          <ins
            className="adsbygoogle"
            style={{ display: "block", width: "100%", height: "250px" }}
            data-ad-client="ca-pub-xxxxxxxxxxxxxxxx"
            data-ad-slot="xxxxxxxxxx"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </aside>
  )
}
