namespace ANNUAIRECONGO.Domain.Logs;

// ── Log action constants ──────────────────────────────────────────────────
public static class AdminActions
{
    public const string ValidatedCompany   = "validated_company";
    public const string RejectedCompany    = "rejected_company";
    public const string SuspendedCompany   = "suspended_company";
    public const string ReactivatedCompany = "reactivated_company";
    public const string FeaturedCompany    = "featured_company";
    public const string OverridePlan       = "override_plan";
    public const string SuspendedUser      = "suspended_user";
    public const string ActivatedUser      = "activated_user";
    public const string ChangedRole        = "changed_role";
    public const string CreatedSector      = "created_sector";
    public const string DeactivatedSector  = "deactivated_sector";
    public const string ReviewedReport     = "reviewed_report";
    public const string DismissedReport    = "dismissed_report";

    public const string DeletedCity        = "deleted_city";

    public const string DeletedRegion      = "deleted_region";

    public const string UpdatedSector      = "updated_sector";

    public const string DeletedSector      = "deleted_sector";

    public const string UpdatedPlan        = "updated_plan";

    public const string ActivatedPlan      = "activated_plan";

    public const string DeactivatedPlan    = "deactivated_plan";

    public const string VerifiedCompany     = "verified_company";
}
