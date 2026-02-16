import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../infra/database/prisma.service';

@Injectable()
export class TermsService {
    private readonly logger = new Logger(TermsService.name);

    constructor(private readonly prisma: PrismaService) { }

    async createOrUpdate(data: {
        type: string;
        content_pt: string;
        content_en: string;
        content_es: string;
        content_fr: string;
        effectiveAt: string;
        createdById: string;
    }) {
        const effectiveDate = new Date(data.effectiveAt);
        // Minimum 15 days from now
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 15);

        if (effectiveDate < minDate) {
            effectiveDate.setTime(minDate.getTime());
        }

        const doc = await (this.prisma as any).legalDocument.create({
            data: {
                type: data.type, // "terms" | "privacy"
                content_pt: data.content_pt,
                content_en: data.content_en,
                content_es: data.content_es,
                content_fr: data.content_fr,
                effectiveAt: effectiveDate,
                createdById: data.createdById,
            },
        });

        this.logger.log(`Legal document "${data.type}" created, effective at ${effectiveDate.toISOString()}`);
        return doc;
    }

    async getLatest(type: string) {
        const doc = await (this.prisma as any).legalDocument.findFirst({
            where: { type },
            orderBy: { savedAt: 'desc' },
        });

        if (!doc) throw new NotFoundException(`No ${type} document found`);
        return doc;
    }

    async getAll(type?: string) {
        const where = type ? { type } : {};
        return (this.prisma as any).legalDocument.findMany({
            where,
            orderBy: { savedAt: 'desc' },
            take: 20,
        });
    }

    async getEffectiveDocument(type: string, language: string = 'PT') {
        const doc = await (this.prisma as any).legalDocument.findFirst({
            where: {
                type,
                effectiveAt: { lte: new Date() },
            },
            orderBy: { effectiveAt: 'desc' },
        });

        if (!doc) return null;

        const langKey = `content_${language.toLowerCase()}`;
        const content = doc[langKey] || doc.content_en || doc.content_pt;

        return {
            id: doc.id,
            type: doc.type,
            content,
            effectiveAt: doc.effectiveAt,
            savedAt: doc.savedAt,
        };
    }

    async checkNewTermsForUser(userId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: userId },
        });

        if (!tenant) return { hasNewTerms: false };

        const lastAccepted = (tenant as any).lastTermsAcceptedAt || new Date(0);

        const newTerms = await (this.prisma as any).legalDocument.findFirst({
            where: {
                type: 'terms',
                effectiveAt: { lte: new Date(), gt: lastAccepted },
            },
            orderBy: { effectiveAt: 'desc' },
        });

        const newPrivacy = await (this.prisma as any).legalDocument.findFirst({
            where: {
                type: 'privacy',
                effectiveAt: { lte: new Date(), gt: lastAccepted },
            },
            orderBy: { effectiveAt: 'desc' },
        });

        return {
            hasNewTerms: !!newTerms,
            hasNewPrivacy: !!newPrivacy,
            termsId: newTerms?.id || null,
            privacyId: newPrivacy?.id || null,
        };
    }

    async acceptTerms(userId: string) {
        await this.prisma.tenant.update({
            where: { id: userId },
            data: { lastTermsAcceptedAt: new Date() } as any,
        });
        return { success: true };
    }
}
