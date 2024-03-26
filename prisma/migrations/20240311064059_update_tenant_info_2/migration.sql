-- AlterTable
ALTER TABLE `tenant_info` MODIFY `project_name` VARCHAR(100) NULL,
    MODIFY `project_address` VARCHAR(100) NULL,
    MODIFY `manager` INTEGER NULL,
    MODIFY `chiefEngineer` INTEGER NULL,
    MODIFY `development_organization` VARCHAR(100) NULL,
    MODIFY `design_organization` VARCHAR(100) NULL,
    MODIFY `supervisor_organization` VARCHAR(100) NULL;
