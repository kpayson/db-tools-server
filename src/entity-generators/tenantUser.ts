import { SeedEntity } from "../lib/dbSeeder";

export const tenantUserEntity: SeedEntity = {
    name: 'TenantUser',
    dataGen: (keys, i) => {
        const tenantUser = {
            tenantId: keys.tenantId,
            userId: keys.userId
        }
        return tenantUser
    },
    isManyToManyRelation: true,
    foreignKeyValuesQuery: `Select Tenant.id as tenantId, User.id as userId From \`Tenant\`, \`User\` `
}