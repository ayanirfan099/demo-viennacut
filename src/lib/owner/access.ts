export function isOwnerRole(role: string | null | undefined): boolean {
  return role?.split(",").includes("admin") ?? false;
}

export function isBanned(user: { banned?: boolean | null; banExpires?: Date | null }): boolean {
  return !!user.banned && (!user.banExpires || user.banExpires > new Date());
}
