import { getServerSession } from "next-auth/next"
import * as z from "zod"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

const listingCreateSchema = z.object({
  title: z.string(),
  description: z.string(),
  roomCount: z.number(),
  bathRoomCount: z.number(),
  bedCount: z.number(),
  adultCount: z.number(),
  childrenCount: z.number(),
  infantCount: z.number(),
  price: z.number(),
  serviceFee: z.number(),
  location: z.string(),
  latlng: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  categoryId: z.string(),
  amenities: z.array(z.string()),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorized", { status: 403 })
    }

    if (session.user.role !== "ADMIN") {
      return new Response("Unauthorized", { status: 403 })
    }

    const listing = await db.listing.findMany({
      select: {},
    })

    return new Response(JSON.stringify(listing))
  } catch (error) {
    return new Response(null, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorized", { status: 403 })
    }

    if (session.user?.role !== "ADMIN") {
      return new Response("Unauthorized", { status: 403 })
    }

    const json = await req.json()
    const body = listingCreateSchema.parse(json)

    await db.listing.create({
      data: {
        title: body.title,
        description: body.description,
        roomCount: body.roomCount,
        bathRoomCount: body.bathRoomCount,
        bedCount: body.bedCount,
        adultCount: body.adultCount,
        childrenCount: body.childrenCount,
        infantCount: body.infantCount,
        price: body.price,
        serviceFee: body.serviceFee,
        location: body.location,
        latlng: body.latlng,
        userId: session.user.id,
        categoryId: body.categoryId,
        amenities: {
          connect: body.amenities.map((amenities) => ({
            id: amenities,
          })),
        },
      },
    })

    return new Response(null, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 })
    }

    return new Response(null, { status: 500 })
  }
}
