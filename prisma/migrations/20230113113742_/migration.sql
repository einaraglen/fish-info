-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_species_id_fkey" FOREIGN KEY ("species_id") REFERENCES "Species"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
