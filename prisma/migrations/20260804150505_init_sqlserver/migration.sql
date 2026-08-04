BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000),
    [email] NVARCHAR(1000) NOT NULL,
    [emailVerified] DATETIME2,
    [image] NVARCHAR(1000),
    [passwordHash] NVARCHAR(1000),
    [role] NVARCHAR(1000) NOT NULL CONSTRAINT [User_role_df] DEFAULT 'CLIENT',
    [phone] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [User_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[Account] (
    [userId] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [provider] NVARCHAR(1000) NOT NULL,
    [providerAccountId] NVARCHAR(1000) NOT NULL,
    [refresh_token] NVARCHAR(1000),
    [access_token] NVARCHAR(1000),
    [expires_at] INT,
    [token_type] NVARCHAR(1000),
    [scope] NVARCHAR(1000),
    [id_token] NVARCHAR(1000),
    [session_state] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Account_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Account_pkey] PRIMARY KEY CLUSTERED ([provider],[providerAccountId])
);

-- CreateTable
CREATE TABLE [dbo].[Session] (
    [sessionToken] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Session_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Session_sessionToken_key] UNIQUE NONCLUSTERED ([sessionToken])
);

-- CreateTable
CREATE TABLE [dbo].[VerificationToken] (
    [identifier] NVARCHAR(1000) NOT NULL,
    [token] NVARCHAR(1000) NOT NULL,
    [expires] DATETIME2 NOT NULL,
    CONSTRAINT [VerificationToken_pkey] PRIMARY KEY CLUSTERED ([identifier],[token])
);

-- CreateTable
CREATE TABLE [dbo].[Booking] (
    [id] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [phone] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Booking_status_df] DEFAULT 'NEW',
    [userId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Booking_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Booking_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Booking_date_phone_key] UNIQUE NONCLUSTERED ([date],[phone])
);

-- CreateTable
CREATE TABLE [dbo].[DayCapacity] (
    [date] DATETIME2 NOT NULL,
    [capacity] INT NOT NULL CONSTRAINT [DayCapacity_capacity_df] DEFAULT 6,
    [blocked] BIT NOT NULL CONSTRAINT [DayCapacity_blocked_df] DEFAULT 0,
    CONSTRAINT [DayCapacity_pkey] PRIMARY KEY CLUSTERED ([date])
);

-- CreateTable
CREATE TABLE [dbo].[Lead] (
    [id] NVARCHAR(1000) NOT NULL,
    [type] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Lead_status_df] DEFAULT 'NEW',
    [name] NVARCHAR(1000) NOT NULL,
    [email] NVARCHAR(1000),
    [phone] NVARCHAR(1000) NOT NULL,
    [payload] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Lead_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Lead_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Brief] (
    [id] NVARCHAR(1000) NOT NULL,
    [leadId] NVARCHAR(1000) NOT NULL,
    [clientName] NVARCHAR(1000) NOT NULL,
    [brandName] NVARCHAR(1000) NOT NULL,
    [briefDate] DATETIME2,
    [email] NVARCHAR(1000),
    [phone] NVARCHAR(1000) NOT NULL,
    [mainGoals] NVARCHAR(1000),
    [roleModel] NVARCHAR(1000),
    [competitorsLinks] NVARCHAR(1000),
    [brandIdentity] NVARCHAR(1000),
    [brandLevel] NVARCHAR(1000),
    [customerSegment] NVARCHAR(1000),
    [businessType] NVARCHAR(1000),
    [socialPlatforms] NVARCHAR(1000) NOT NULL,
    [brandSlogan] NVARCHAR(1000),
    [preferredColors] NVARCHAR(1000),
    [colorNumbers] NVARCHAR(1000),
    [toneOfVoice] NVARCHAR(1000) NOT NULL,
    [advertisingPlatforms] NVARCHAR(1000) NOT NULL,
    [adsBudget] NVARCHAR(1000),
    [targetAge] NVARCHAR(1000),
    [branchesNumber] INT,
    [locations] NVARCHAR(1000),
    [gender] NVARCHAR(1000),
    [languages] NVARCHAR(1000) NOT NULL,
    [platformLinks] NVARCHAR(1000),
    [notes] NVARCHAR(1000),
    [businessModel] NVARCHAR(1000),
    [digitalMarketingExperience] NVARCHAR(1000),
    [uniqueSellingPoints] NVARCHAR(1000),
    [planObjectives] NVARCHAR(1000),
    [userId] NVARCHAR(1000),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Brief_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [Brief_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Brief_leadId_key] UNIQUE NONCLUSTERED ([leadId])
);

-- CreateTable
CREATE TABLE [dbo].[PackageQuote] (
    [id] NVARCHAR(1000) NOT NULL,
    [leadId] NVARCHAR(1000) NOT NULL,
    [planName] NVARCHAR(1000),
    [addOnIds] NVARCHAR(1000) NOT NULL,
    [total] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [PackageQuote_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [PackageQuote_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PackageQuote_leadId_key] UNIQUE NONCLUSTERED ([leadId])
);

-- CreateTable
CREATE TABLE [dbo].[Project] (
    [id] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [image] NVARCHAR(1000) NOT NULL,
    [imageAlt] NVARCHAR(1000) NOT NULL,
    [details] NVARCHAR(1000),
    [published] BIT NOT NULL CONSTRAINT [Project_published_df] DEFAULT 1,
    [order] INT NOT NULL CONSTRAINT [Project_order_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Project_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Project_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Project_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[Industry] (
    [id] NVARCHAR(1000) NOT NULL,
    [slug] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [icon] NVARCHAR(1000) NOT NULL,
    [headline] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [order] INT NOT NULL CONSTRAINT [Industry_order_df] DEFAULT 0,
    CONSTRAINT [Industry_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Industry_slug_key] UNIQUE NONCLUSTERED ([slug])
);

-- CreateTable
CREATE TABLE [dbo].[IndustryClient] (
    [id] NVARCHAR(1000) NOT NULL,
    [industryId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [result] NVARCHAR(1000) NOT NULL,
    [order] INT NOT NULL CONSTRAINT [IndustryClient_order_df] DEFAULT 0,
    CONSTRAINT [IndustryClient_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ClientLogo] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [category] NVARCHAR(1000) NOT NULL,
    [file] NVARCHAR(1000) NOT NULL,
    [objectPosition] NVARCHAR(1000) NOT NULL CONSTRAINT [ClientLogo_objectPosition_df] DEFAULT '50% 50%',
    [size] NVARCHAR(1000) NOT NULL CONSTRAINT [ClientLogo_size_df] DEFAULT 'md',
    [order] INT NOT NULL CONSTRAINT [ClientLogo_order_df] DEFAULT 0,
    CONSTRAINT [ClientLogo_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ValueProp] (
    [id] NVARCHAR(1000) NOT NULL,
    [icon] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [order] INT NOT NULL CONSTRAINT [ValueProp_order_df] DEFAULT 0,
    CONSTRAINT [ValueProp_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[TeamMember] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [role] NVARCHAR(1000) NOT NULL,
    [photo] NVARCHAR(1000),
    [order] INT NOT NULL CONSTRAINT [TeamMember_order_df] DEFAULT 0,
    CONSTRAINT [TeamMember_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ServiceItem] (
    [id] NVARCHAR(1000) NOT NULL,
    [icon] NVARCHAR(1000) NOT NULL,
    [eyebrow] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [cta] NVARCHAR(1000) NOT NULL,
    [order] INT NOT NULL CONSTRAINT [ServiceItem_order_df] DEFAULT 0,
    CONSTRAINT [ServiceItem_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PackagePlan] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [tagline] NVARCHAR(1000) NOT NULL,
    [price] NVARCHAR(1000) NOT NULL,
    [period] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [features] NVARCHAR(1000) NOT NULL,
    [cta] NVARCHAR(1000) NOT NULL,
    [featured] BIT NOT NULL CONSTRAINT [PackagePlan_featured_df] DEFAULT 0,
    [order] INT NOT NULL CONSTRAINT [PackagePlan_order_df] DEFAULT 0,
    CONSTRAINT [PackagePlan_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [PackagePlan_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[PackageAddOn] (
    [id] NVARCHAR(1000) NOT NULL,
    [label] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [price] INT NOT NULL,
    [order] INT NOT NULL CONSTRAINT [PackageAddOn_order_df] DEFAULT 0,
    CONSTRAINT [PackageAddOn_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[HeroStats] (
    [id] INT NOT NULL CONSTRAINT [HeroStats_id_df] DEFAULT 1,
    [growth] INT NOT NULL,
    [revenue] INT NOT NULL,
    [roi] FLOAT(53) NOT NULL,
    CONSTRAINT [HeroStats_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ClientStats] (
    [id] INT NOT NULL CONSTRAINT [ClientStats_id_df] DEFAULT 1,
    [happyClients] INT NOT NULL,
    [successfulProjects] INT NOT NULL,
    CONSTRAINT [ClientStats_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ResultCard] (
    [id] NVARCHAR(1000) NOT NULL,
    [stat] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [tone] NVARCHAR(1000) NOT NULL,
    [industrySlug] NVARCHAR(1000) NOT NULL,
    [image] NVARCHAR(1000) NOT NULL,
    [imageAlt] NVARCHAR(1000) NOT NULL,
    [order] INT NOT NULL CONSTRAINT [ResultCard_order_df] DEFAULT 0,
    CONSTRAINT [ResultCard_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Platform] (
    [id] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [order] INT NOT NULL CONSTRAINT [Platform_order_df] DEFAULT 0,
    CONSTRAINT [Platform_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Platform_name_key] UNIQUE NONCLUSTERED ([name])
);

-- CreateTable
CREATE TABLE [dbo].[SiteSettings] (
    [id] INT NOT NULL CONSTRAINT [SiteSettings_id_df] DEFAULT 1,
    [phone] NVARCHAR(1000) NOT NULL,
    [address] NVARCHAR(1000) NOT NULL,
    [mapUrl] NVARCHAR(1000) NOT NULL,
    [socials] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [SiteSettings_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Account] ADD CONSTRAINT [Account_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Session] ADD CONSTRAINT [Session_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Booking] ADD CONSTRAINT [Booking_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[Lead] ADD CONSTRAINT [Lead_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Brief] ADD CONSTRAINT [Brief_leadId_fkey] FOREIGN KEY ([leadId]) REFERENCES [dbo].[Lead]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Brief] ADD CONSTRAINT [Brief_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PackageQuote] ADD CONSTRAINT [PackageQuote_leadId_fkey] FOREIGN KEY ([leadId]) REFERENCES [dbo].[Lead]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[IndustryClient] ADD CONSTRAINT [IndustryClient_industryId_fkey] FOREIGN KEY ([industryId]) REFERENCES [dbo].[Industry]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
