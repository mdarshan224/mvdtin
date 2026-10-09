import unittest
import pandas as pd
from analytics.processing import summarize
from regression.model import fit_linear
class DataTests(unittest.TestCase):
    def test_aggregate_grouping(self):
        frame=pd.DataFrame({'date':['2026-10-01']*2,'event_type':['PAGE_VIEW']*2,'count':[2,3]})
        self.assertEqual(int(summarize(frame)['count'].iloc[0]),5)
    def test_rejects_personal_fields(self):
        with self.assertRaises(ValueError):summarize(pd.DataFrame({'date':['2026-10-01'],'event_type':['PAGE_VIEW'],'count':[1],'email':['person@example.test']}))
    def test_rejects_negative(self):
        with self.assertRaises(ValueError):summarize(pd.DataFrame({'date':['2026-10-01'],'event_type':['PAGE_VIEW'],'count':[-1]}))
    def test_regression_known_line(self):
        result=fit_linear([1,2,3],[3,5,7]);self.assertAlmostEqual(result['slope'],2);self.assertAlmostEqual(result['intercept'],1);self.assertAlmostEqual(result['r_squared'],1)
    def test_regression_rejects_constant_x(self):
        with self.assertRaises(ValueError):fit_linear([1,1],[2,3])
if __name__=='__main__':unittest.main()
