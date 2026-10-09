from odoo import fields, models
class Partner(models.Model):
    _inherit='res.partner'
    dtm_external_reference=fields.Char(string='DTM external reference',index=True,copy=False)
