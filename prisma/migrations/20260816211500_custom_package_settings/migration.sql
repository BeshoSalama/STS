CREATE TABLE [dbo].[CustomPackageSettings] (
    [id] INT NOT NULL CONSTRAINT [CustomPackageSettings_id_df] DEFAULT 1,
    [quantityDiscountStart] INT NOT NULL CONSTRAINT [CustomPackageSettings_quantityDiscountStart_df] DEFAULT 5,
    [quantityDiscountPercent] INT NOT NULL CONSTRAINT [CustomPackageSettings_quantityDiscountPercent_df] DEFAULT 10,
    [maxQuantityDiscount] INT NOT NULL CONSTRAINT [CustomPackageSettings_maxQuantityDiscount_df] DEFAULT 25,
    [annualDiscountPercent] INT NOT NULL CONSTRAINT [CustomPackageSettings_annualDiscountPercent_df] DEFAULT 15,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CustomPackageSettings_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [CustomPackageSettings_pkey] PRIMARY KEY CLUSTERED ([id])
);

INSERT INTO [dbo].[CustomPackageSettings] (
    [id],
    [quantityDiscountStart],
    [quantityDiscountPercent],
    [maxQuantityDiscount],
    [annualDiscountPercent],
    [updatedAt]
) VALUES (1, 5, 10, 25, 15, CURRENT_TIMESTAMP);
