1. yarn
2. `npx prisma init`
   `npx prisma migrate dev --name init`
   `npx prisma generate`
   `npx prisma studio`
3. complete .env
4. yarn dev

package,json 中的\_moduleAliases 字段 dev 时改成{"@": "app"}，build 是{"@": "dist/app"}
