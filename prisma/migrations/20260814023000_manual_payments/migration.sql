CREATE TABLE [dbo].[ManualPaymentSettings] (
    [id] INT NOT NULL CONSTRAINT [ManualPaymentSettings_id_df] DEFAULT 1,
    [vodafoneCashEnabled] BIT NOT NULL CONSTRAINT [ManualPaymentSettings_vodafoneCashEnabled_df] DEFAULT 1,
    [vodafoneCashNumber] NVARCHAR(1000),
    [vodafoneCashAccountName] NVARCHAR(1000),
    [vodafoneCashInstructions] NVARCHAR(MAX),
    [instapayEnabled] BIT NOT NULL CONSTRAINT [ManualPaymentSettings_instapayEnabled_df] DEFAULT 1,
    [instapayAddress] NVARCHAR(1000),
    [instapayAccountName] NVARCHAR(1000),
    [instapayInstructions] NVARCHAR(MAX),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ManualPaymentSettings_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ManualPaymentSettings_pkey] PRIMARY KEY CLUSTERED ([id])
);

CREATE TABLE [dbo].[PaymentTransaction] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [planId] NVARCHAR(1000) NOT NULL,
    [planNameSnapshot] NVARCHAR(1000) NOT NULL,
    [amount] DECIMAL(12,2) NOT NULL,
    [currency] NVARCHAR(1000) NOT NULL CONSTRAINT [PaymentTransaction_currency_df] DEFAULT 'EGP',
    [paymentMethod] NVARCHAR(1000) NOT NULL,
    [senderName] NVARCHAR(1000) NOT NULL,
    [senderPhone] NVARCHAR(1000) NOT NULL,
    [transactionReference] NVARCHAR(1000),
    [proofImage] NVARCHAR(1000) NOT NULL,
    [proofMimeType] NVARCHAR(1000) NOT NULL,
    [transferDate] DATETIME2 NOT NULL,
    [transferTime] NVARCHAR(1000),
    [notes] NVARCHAR(MAX),
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [PaymentTransaction_status_df] DEFAULT 'PENDING',
    [adminNotes] NVARCHAR(MAX),
    [reviewedBy] NVARCHAR(1000),
    [reviewedAt] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PaymentTransaction_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [PaymentTransaction_pkey] PRIMARY KEY CLUSTERED ([id])
);

CREATE TABLE [dbo].[UserSubscription] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [planId] NVARCHAR(1000) NOT NULL,
    [planNameSnapshot] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [UserSubscription_status_df] DEFAULT 'ACTIVE',
    [startsAt] DATETIME2 NOT NULL CONSTRAINT [UserSubscription_startsAt_df] DEFAULT CURRENT_TIMESTAMP,
    [endsAt] DATETIME2,
    [activatedByPaymentId] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserSubscription_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UserSubscription_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserSubscription_userId_key] UNIQUE NONCLUSTERED ([userId]),
    CONSTRAINT [UserSubscription_activatedByPaymentId_key] UNIQUE NONCLUSTERED ([activatedByPaymentId])
);

CREATE NONCLUSTERED INDEX [PaymentTransaction_userId_status_idx] ON [dbo].[PaymentTransaction]([userId], [status]);
CREATE NONCLUSTERED INDEX [PaymentTransaction_planId_idx] ON [dbo].[PaymentTransaction]([planId]);
CREATE NONCLUSTERED INDEX [PaymentTransaction_paymentMethod_idx] ON [dbo].[PaymentTransaction]([paymentMethod]);
CREATE NONCLUSTERED INDEX [PaymentTransaction_status_createdAt_idx] ON [dbo].[PaymentTransaction]([status], [createdAt]);
CREATE NONCLUSTERED INDEX [UserSubscription_planId_idx] ON [dbo].[UserSubscription]([planId]);
CREATE NONCLUSTERED INDEX [UserSubscription_status_idx] ON [dbo].[UserSubscription]([status]);

ALTER TABLE [dbo].[PaymentTransaction] ADD CONSTRAINT [PaymentTransaction_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PaymentTransaction] ADD CONSTRAINT [PaymentTransaction_planId_fkey] FOREIGN KEY ([planId]) REFERENCES [dbo].[PackagePlan]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[PaymentTransaction] ADD CONSTRAINT [PaymentTransaction_reviewedBy_fkey] FOREIGN KEY ([reviewedBy]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UserSubscription] ADD CONSTRAINT [UserSubscription_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE [dbo].[UserSubscription] ADD CONSTRAINT [UserSubscription_planId_fkey] FOREIGN KEY ([planId]) REFERENCES [dbo].[PackagePlan]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;
