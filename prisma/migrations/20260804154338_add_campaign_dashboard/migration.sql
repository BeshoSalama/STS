BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Campaign] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [platform] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Campaign_status_df] DEFAULT 'ACTIVE',
    [budget] INT NOT NULL,
    [spend] INT NOT NULL,
    [revenue] INT NOT NULL,
    [conversions] INT NOT NULL,
    [roas] FLOAT(53) NOT NULL,
    [conversionRate] FLOAT(53) NOT NULL,
    [cac] INT NOT NULL,
    [impressions] INT NOT NULL,
    [sessions] INT NOT NULL,
    [startDate] DATETIME2 NOT NULL,
    [endDate] DATETIME2 NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [Campaign_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [Campaign_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CampaignDailyMetric] (
    [id] NVARCHAR(1000) NOT NULL,
    [campaignId] NVARCHAR(1000) NOT NULL,
    [date] DATETIME2 NOT NULL,
    [conversions] INT NOT NULL,
    [sessions] INT NOT NULL,
    [revenue] INT NOT NULL,
    [spend] INT NOT NULL,
    CONSTRAINT [CampaignDailyMetric_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [CampaignDailyMetric_campaignId_date_key] UNIQUE NONCLUSTERED ([campaignId],[date])
);

-- CreateTable
CREATE TABLE [dbo].[CampaignTrafficSource] (
    [id] NVARCHAR(1000) NOT NULL,
    [campaignId] NVARCHAR(1000) NOT NULL,
    [source] NVARCHAR(1000) NOT NULL,
    [color] NVARCHAR(1000) NOT NULL,
    [sessions] INT NOT NULL,
    [percentage] INT NOT NULL,
    [conversions] INT NOT NULL,
    CONSTRAINT [CampaignTrafficSource_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[CampaignInsight] (
    [id] NVARCHAR(1000) NOT NULL,
    [campaignId] NVARCHAR(1000) NOT NULL,
    [tone] NVARCHAR(1000) NOT NULL,
    [title] NVARCHAR(1000) NOT NULL,
    [description] NVARCHAR(1000) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [CampaignInsight_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [CampaignInsight_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[Campaign] ADD CONSTRAINT [Campaign_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[CampaignDailyMetric] ADD CONSTRAINT [CampaignDailyMetric_campaignId_fkey] FOREIGN KEY ([campaignId]) REFERENCES [dbo].[Campaign]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CampaignTrafficSource] ADD CONSTRAINT [CampaignTrafficSource_campaignId_fkey] FOREIGN KEY ([campaignId]) REFERENCES [dbo].[Campaign]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[CampaignInsight] ADD CONSTRAINT [CampaignInsight_campaignId_fkey] FOREIGN KEY ([campaignId]) REFERENCES [dbo].[Campaign]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
