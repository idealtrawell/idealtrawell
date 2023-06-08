import { notFound, redirect } from "next/navigation"
import { Listing } from "@prisma/client"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import getCurrentUser from "@/lib/session"
import ListingForm from "@/components/listing-form"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

async function getListing(listingId: Listing["id"]) {
  return await db.listing.findFirst({
    where: {
      id: listingId,
    },
    include: {
      amenities: true,
    },
  })
}

interface UpdateCategoryProps {
  params: { listingId: string }
}

export default async function UpdateListing({ params }: UpdateCategoryProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/login")
  }

  const categories = await db.category.findMany()
  const amenities = await db.amenities.findMany()

  const listing = await getListing(params.listingId)

  if (!listing) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <pre className="mt-2 w-full rounded-md bg-slate-950 p-4">
        <code className="text-white">{JSON.stringify(listing, null, 2)}</code>
      </pre>
      <div>
        <Link
          href="/admin-dashboard"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-3xl flex-col justify-center">
        <ListingForm categories={categories} amenities={amenities} listing={listing} />
      </div>
    </div>
  )
}
