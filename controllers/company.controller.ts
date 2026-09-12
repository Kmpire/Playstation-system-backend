import { eq } from "drizzle-orm";
import { Controller, Route, Tags, Get, Put, Post, Body } from "tsoa";
import { db } from "../database/db.js";
import { companyInfo, companySocials } from "../database/schema.js";
import { seedCompany } from "../database/seed.js";
import type {
  CompanyInfoDto,
  CompanyResponse,
} from "../types/company.types.js";

async function getFullCompanyInfo(): Promise<CompanyInfoDto> {
  const [info] = await db.select().from(companyInfo).where(eq(companyInfo.id, 1));
  if (!info) {
    return seedCompany;
  }

  const socials = await db
    .select({
      label: companySocials.label,
      icon: companySocials.icon,
      handle: companySocials.handle,
    })
    .from(companySocials)
    .where(eq(companySocials.companyId, 1));

  return {
    ...info,
    socials,
  };
}

@Route("api/v1/company")
@Tags("Company")
export class CompanyController extends Controller {
  @Get("")
  public async getCompanyInfo(): Promise<CompanyResponse> {
    const data = await getFullCompanyInfo();
    return { success: true, data };
  }

  @Put("")
  public async updateCompanyInfo(@Body() info: CompanyInfoDto): Promise<CompanyResponse> {
    const [existing] = await db.select().from(companyInfo).where(eq(companyInfo.id, 1));

    if (existing) {
      await db
        .update(companyInfo)
        .set({
          name: info.name ?? existing.name,
          nameAr: info.nameAr ?? existing.nameAr,
          phone: info.phone ?? existing.phone,
          email: info.email ?? existing.email,
          address: info.address ?? existing.address,
          addressAr: info.addressAr ?? existing.addressAr,
          updatedAt: new Date(),
        })
        .where(eq(companyInfo.id, 1));
    } else {
      await db.insert(companyInfo).values({
        id: 1,
        name: info.name || seedCompany.name,
        nameAr: info.nameAr || seedCompany.nameAr,
        phone: info.phone,
        email: info.email,
        address: info.address,
        addressAr: info.addressAr,
      });
    }

    if (Array.isArray(info.socials)) {
      await db.delete(companySocials).where(eq(companySocials.companyId, 1));
      for (const soc of info.socials) {
        await db.insert(companySocials).values({
          companyId: 1,
          label: String(soc.label),
          icon: String(soc.icon),
          handle: String(soc.handle),
        });
      }
    }

    const data = await getFullCompanyInfo();
    return { success: true, data };
  }

  @Post("")
  public async saveCompanyInfo(@Body() info: CompanyInfoDto): Promise<CompanyResponse> {
    return this.updateCompanyInfo(info);
  }
}
