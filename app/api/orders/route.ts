import { NextResponse } from "next/server";
import { placeOrder, type PlaceOrderInput } from "@/lib/orders-api";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PlaceOrderInput;
    const order = await placeOrder(body);
    return NextResponse.json({ order });
  } catch (error) {
    const code = error instanceof Error ? error.message : "order_failed";
    const status =
      code === "empty_cart" ||
      code === "invalid_name" ||
      code === "invalid_phone" ||
      code === "invalid_address" ||
      code === "invalid_qty" ||
      code === "product_unavailable" ||
      code === "out_of_stock"
        ? 400
        : 500;
    return NextResponse.json({ error: code }, { status });
  }
}
