-- CreateIndex
CREATE UNIQUE INDEX "Company_userId_key" ON "public"."Company"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Investor_userId_key" ON "public"."Investor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Shareholder_userId_key" ON "public"."Shareholder"("userId");
