import { base44 } from "@/api/base44Client";

export async function submitAccessRequest(payload) {
  const res = await base44.functions.invoke("submitAccessRequest", payload);
  if (res.data?.error) throw new Error(res.data.error);
  return res.data;
}